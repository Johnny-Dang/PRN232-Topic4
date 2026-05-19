using System;
using BCrypt.Net;

namespace BusinessLogicLayer.Helpers
{
    public static class PasswordHasher
    {
        // Use BCrypt for password hashing. WorkFactor is the log2 cost (default 12).
        public static string Hash(string password, int workFactor = 12)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor);
        }

        public static bool Verify(string password, string stored)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, stored);
            }
            catch
            {
                return false;
            }
        }
    }
}
