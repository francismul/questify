import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    resources: {
      en: {
        common: {
          dashboard: 'Dashboard',
          logout: 'Logout',
          language: 'Language',
          english: 'English',
          spanish: 'Spanish',
          french: 'French',
          german: 'German',
          notifications: 'Notifications',
          profile: 'Profile',
          settings: 'Settings',
          courses: 'Courses',
          reports: 'Reports',
          messages: 'Messages',
          achievements: 'Achievements',
          goals: 'Goals',
          students: 'Students',
          analytics: 'Analytics',
          campaigns: 'Campaigns',
          myProfile: 'My Profile',
          myCourses: 'My Courses',
          loggingOut: 'Logging out...',
          guestUser: 'Guest User',
          student: 'Student',
          teacher: 'Teacher',
        },
        navigation: {
          home: 'Home',
          dashboard: 'Dashboard',
        }
      },
      es: {
        common: {
          dashboard: 'Panel de Control',
          logout: 'Cerrar Sesión',
          language: 'Idioma',
          english: 'Inglés',
          spanish: 'Español',
          french: 'Francés',
          german: 'Alemán',
          notifications: 'Notificaciones',
          profile: 'Perfil',
          settings: 'Configuración',
          courses: 'Cursos',
          reports: 'Reportes',
          messages: 'Mensajes',
          achievements: 'Logros',
          goals: 'Objetivos',
          students: 'Estudiantes',
          analytics: 'Análisis',
          campaigns: 'Campañas',
          myProfile: 'Mi Perfil',
          myCourses: 'Mis Cursos',
          loggingOut: 'Cerrando sesión...',
          guestUser: 'Usuario Invitado',
          student: 'Estudiante',
          teacher: 'Profesor',
        },
        navigation: {
          home: 'Inicio',
          dashboard: 'Panel de Control',
        }
      },
      fr: {
        common: {
          dashboard: 'Tableau de Bord',
          logout: 'Se Déconnecter',
          language: 'Langue',
          english: 'Anglais',
          spanish: 'Espagnol',
          french: 'Français',
          german: 'Allemand',
          notifications: 'Notifications',
          profile: 'Profil',
          settings: 'Paramètres',
          courses: 'Cours',
          reports: 'Rapports',
          messages: 'Messages',
          achievements: 'Réalisations',
          goals: 'Objectifs',
          students: 'Étudiants',
          analytics: 'Analyses',
          campaigns: 'Campagnes',
          myProfile: 'Mon Profil',
          myCourses: 'Mes Cours',
          loggingOut: 'Déconnexion...',
          guestUser: 'Utilisateur Invité',
          student: 'Étudiant',
          teacher: 'Professeur',
        },
        navigation: {
          home: 'Accueil',
          dashboard: 'Tableau de Bord',
        }
      },
      de: {
        common: {
          dashboard: 'Dashboard',
          logout: 'Abmelden',
          language: 'Sprache',
          english: 'Englisch',
          spanish: 'Spanisch',
          french: 'Französisch',
          german: 'Deutsch',
          notifications: 'Benachrichtigungen',
          profile: 'Profil',
          settings: 'Einstellungen',
          courses: 'Kurse',
          reports: 'Berichte',
          messages: 'Nachrichten',
          achievements: 'Erfolge',
          goals: 'Ziele',
          students: 'Studenten',
          analytics: 'Analysen',
          campaigns: 'Kampagnen',
          myProfile: 'Mein Profil',
          myCourses: 'Meine Kurse',
          loggingOut: 'Abmelden...',
          guestUser: 'Gastbenutzer',
          student: 'Student',
          teacher: 'Lehrer',
        },
        navigation: {
          home: 'Startseite',
          dashboard: 'Dashboard',
        }
      }
    }
  });

export default i18n;