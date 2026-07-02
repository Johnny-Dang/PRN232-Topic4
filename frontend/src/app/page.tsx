'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getDetailedCompetitions, 
  getAnnouncements, 
  Announcement, 
  DetailedCompetition 
} from '@/lib/api';

// Landing components
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import FilterBar from '@/components/landing/FilterBar';
import FeaturedCompetitions from '@/components/landing/FeaturedCompetitions';
import DeadlineFocus from '@/components/landing/DeadlineFocus';
import AnnouncementsGrid from '@/components/landing/AnnouncementsGrid';
import CategoryExploration from '@/components/landing/CategoryExploration';
import StatisticsCounter from '@/components/landing/StatisticsCounter';
import CallToAction from '@/components/landing/CallToAction';
import Footer from '@/components/landing/Footer';
import ActionModal from '@/components/landing/ActionModal';

export default function HomeLandingPage() {
  const router = useRouter();
  
  // Data loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [competitions, setCompetitions] = useState<DetailedCompetition[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Layout & UI states
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [actionTitle, setActionTitle] = useState<string>('');
  const [actionDesc, setActionDesc] = useState<string>('');

  // Refs for smooth scroll
  const competitionsSectionRef = useRef<HTMLDivElement | null>(null);
  const announcementsSectionRef = useRef<HTMLDivElement | null>(null);

  // Monitor scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch session user
  useEffect(() => {
    const stored = localStorage.getItem('seal_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error('Lỗi phân tích cú pháp user session:', e);
      }
    }
  }, []);

  // Fetch competitions & announcements from API
  useEffect(() => {
    setLoading(true);
    Promise.all([getDetailedCompetitions(), getAnnouncements()])
      .then(([comps, anns]) => {
        setCompetitions(comps);
        setAnnouncements(anns);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải dữ liệu trang chủ:', err);
        setLoading(false);
      });
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('seal_user');
    setCurrentUser(null);
    router.refresh();
  };

  // Smooth scroll
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Determine active dashboard route based on user role
  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    switch (currentUser.Role) {
      case 'Leader': return '/leader';
      case 'Member': return '/member';
      case 'Mentor': return '/mentor';
      case 'Judge': return '/judge';
      case 'Coordinator': return '/coordinator';
      default: return '/';
    }
  };

  // Process user action, require authentication if needed
  const handleAction = (title: string, desc: string, isRedirect: boolean = true, redirectUrl: string = '/login') => {
    setActionTitle(title);
    setActionDesc(desc);
    if (!currentUser && isRedirect) {
      // Force user to login page
      router.push(redirectUrl);
    } else {
      setShowSuccessModal(true);
    }
  };

  // Filtered Competitions logic
  const filteredCompetitions = competitions.filter(comp => {
    // 1. Search Query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      comp.Name.toLowerCase().includes(searchLower) ||
      comp.Description.toLowerCase().includes(searchLower) ||
      comp.Organizer.toLowerCase().includes(searchLower) ||
      comp.CategoryLabel.toLowerCase().includes(searchLower);

    // 2. Category Filter
    const matchesCategory = selectedCategory === 'all' || comp.Category === selectedCategory;

    // 3. Quick Filter Chip
    let matchesFilter = true;
    if (selectedFilter === 'open') {
      matchesFilter = comp.Status === 'open';
    } else if (selectedFilter === 'expiring') {
      matchesFilter = comp.Status === 'expiring';
    } else if (selectedFilter === 'upcoming') {
      matchesFilter = comp.Status === 'upcoming';
    } else if (selectedFilter === 'online') {
      matchesFilter = comp.Format === 'Online';
    } else if (selectedFilter === 'offline') {
      matchesFilter = comp.Format === 'Offline';
    } else if (selectedFilter === 'free') {
      // Free mocks (Design, Language)
      matchesFilter = comp.ID === 'DC004' || comp.ID === 'DC005';
    } else if (selectedFilter === 'prized') {
      matchesFilter = comp.Prize !== '';
    }

    return matchesSearch && matchesCategory && matchesFilter;
  });

  // Competitions sorted for deadline focus
  const deadlineCompetitions = [...competitions]
    .filter(c => c.Status === 'expiring' || c.Status === 'open')
    .sort((a, b) => a.DaysLeft - b.DaysLeft);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      
      {/* 1. HEADER / NAVBAR */}
      <Header
        currentUser={currentUser}
        isScrolled={isScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
        scrollToSection={scrollToSection}
        competitionsSectionRef={competitionsSectionRef}
        announcementsSectionRef={announcementsSectionRef}
        handleAction={handleAction}
        getDashboardLink={getDashboardLink}
      />

      {/* 2. HERO BANNER */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        scrollToSection={scrollToSection}
        competitionsSectionRef={competitionsSectionRef}
        announcementsSectionRef={announcementsSectionRef}
        setSelectedFilter={setSelectedFilter}
        handleAction={handleAction}
      />

      {/* 3. SEARCH & QUICK FILTER SECTION */}
      <FilterBar
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 space-y-24">
        
        {/* 4. FEATURED COMPETITIONS */}
        <FeaturedCompetitions
          competitionsSectionRef={competitionsSectionRef}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          loading={loading}
          filteredCompetitions={filteredCompetitions}
          setSelectedFilter={setSelectedFilter}
          setSearchQuery={setSearchQuery}
          handleAction={handleAction}
        />

        {/* 5. DEADLINE FOCUS */}
        <DeadlineFocus
          deadlineCompetitions={deadlineCompetitions}
          loading={loading}
          handleAction={handleAction}
        />

        {/* 6. LATEST ANNOUNCEMENTS */}
        <AnnouncementsGrid
          announcementsSectionRef={announcementsSectionRef}
          announcements={announcements}
          loading={loading}
        />

        {/* 7. CATEGORY EXPLORATION */}
        <CategoryExploration
          setSelectedCategory={setSelectedCategory}
          scrollToSection={scrollToSection}
          competitionsSectionRef={competitionsSectionRef}
        />

        {/* 8. STATISTICS COUNTER */}
        <StatisticsCounter />

        {/* 9. CALL TO ACTION */}
        <CallToAction handleAction={handleAction} />

      </main>

      {/* 10. FOOTER */}
      <Footer />

      {/* 11. ACTION MODAL */}
      <ActionModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={actionTitle}
        description={actionDesc}
        currentUser={currentUser}
        getDashboardLink={getDashboardLink}
        onRedirect={(url) => router.push(url)}
      />

    </div>
  );
}
