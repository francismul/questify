"use client"

import { Menu, Globe, ChevronDown, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { User } from "@/lib/auth-server"
import { logoutAction } from "@/lib/auth-actions"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useSidebar } from "./SidebarProvider"
import { useTranslation } from "react-i18next"

interface Props {
  onMenuToggle?: () => void
  user?: User | null
}

export function TopNavigation({ user }: Props) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const { toggle } = useSidebar()
  const languageRef = useRef<HTMLDivElement>(null)
  const { t, i18n } = useTranslation('common')

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get initials from user name
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U'

  // Handle logout
  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple clicks

    setIsLoggingOut(true)
    try {
      await logoutAction()
      // The logoutAction will handle the redirect to login page
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails, the user will be redirected by logoutAction
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Handle language change
  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language)
    setIsLanguageOpen(false)
  }

  return (
    <header className="bg-primary border-b border-primary/20 px-6 py-4 sticky top-0 z-30 overflow-visible">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary-foreground/10 lg:hidden"
            onClick={toggle}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            {/* Questify Logo */}
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-primary rounded-full" />
            </div>
            <h1 className="text-primary-foreground font-bold text-xl tracking-tight">
              {t('dashboard')}
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Language selector */}
          <div className="relative" ref={languageRef}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground hover:bg-primary-foreground/10 hidden sm:flex"
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            >
              <Globe className="w-4 h-4 mr-2" />
              {t('language')}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            {isLanguageOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-[100] py-1">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleLanguageChange('en')}
                >
                  {t('english')}
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleLanguageChange('es')}
                >
                  {t('spanish')}
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleLanguageChange('fr')}
                >
                  {t('french')}
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleLanguageChange('de')}
                >
                  {t('german')}
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
          </Button>

          {/* User profile */}
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-primary-foreground/20">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={400}
                height={400}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-accent/50"
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-accent to-metric-purple rounded-full flex items-center justify-center ring-2 ring-accent/50">
                <span className="text-sm font-semibold text-accent-foreground">
                  {initials}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-primary-foreground text-sm font-medium leading-none">
                {user?.name || t('guestUser')}
              </span>
              <span className="text-primary-foreground/60 text-xs leading-none mt-1 capitalize">
                {user?.role ? t(user.role.toLowerCase()) : t('student')}
              </span>
            </div>
          </div>

          {/* User Menu Dropdown */}
          {/* Removed duplicate user menu - logout button handles this functionality */}

          {/* CTA Button */}
          <Button 
            size="sm" 
            variant="accent"
            className="shadow-lg shadow-accent/20 hidden sm:flex"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? t('loggingOut') : t('logout')}
          </Button>
        </div>
      </div>
    </header>
  )
}
