'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRect: DOMRect | null;
  setTriggerRect: (rect: DOMRect | null) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(
  null
);

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu components must be used within a DropdownMenu');
  }
  return context;
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRect, setTriggerRect }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, asChild, className, ...props }, ref) => {
    const { setOpen, open, setTriggerRect } = useDropdownMenu();

    const handleClick = () => {
      setOpen(!open);
      if (!open) {
        setTimeout(() => {
          const button = document.activeElement;
          if (button instanceof HTMLElement) {
            setTriggerRect(button.getBoundingClientRect());
          }
        }, 0);
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
        onClick: handleClick,
      });
    }

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon-sm"
        className={cn('', className)}
        onClick={handleClick}
        {...props}
      >
        {children || <MoreHorizontal className="size-4" />}
      </Button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, className, align = 'end', ...props }, ref) => {
    const { open, setOpen, triggerRect } = useDropdownMenu();
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [open, setOpen]);

    if (!open || typeof document === 'undefined' || !triggerRect) return null;

    const style: React.CSSProperties = {
      position: 'fixed',
      top: triggerRect.bottom + 4,
      left: align === 'end'
        ? triggerRect.right
        : align === 'start'
          ? triggerRect.left
          : triggerRect.left + triggerRect.width / 2,
      transform: align === 'center' ? 'translateX(-50%)' : align === 'end' ? 'translateX(-100%)' : undefined,
      zIndex: 9999,
    };

    return createPortal(
      <div
        ref={contentRef}
        className={cn(
          'min-w-[8rem] overflow-visible rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg',
          'animate-in fade-in-0 zoom-in-95',
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </div>,
      document.body
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, inset, children, ...props }, ref) => {
    const { setOpen } = useDropdownMenu();

    return (
      <button
        ref={ref}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:bg-accent focus:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          inset && 'pl-8',
          className
        )}
        onClick={() => setOpen(false)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
