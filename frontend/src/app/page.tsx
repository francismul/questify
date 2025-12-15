import Link from 'next/link'
import { ArrowRightIcon, AcademicCapIcon, ChartBarIcon, BellIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">Questify</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A home edition e-learning platform that brings university-style learning management 
            to your family. Track progress, build accountability, and celebrate learning together.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/auth/login" 
              className="btn-primary inline-flex items-center gap-2 text-lg"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link 
              href="/about" 
              className="btn-secondary inline-flex items-center text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<AcademicCapIcon className="w-10 h-10 text-primary-600" />}
            title="Task Management"
            description="Create, assign, and track learning tasks with difficulty levels, deadlines, and expected effort."
          />
          <FeatureCard
            icon={<ChartBarIcon className="w-10 h-10 text-primary-600" />}
            title="Progress Tracking"
            description="Monitor completion rates, streaks, and time management with detailed analytics."
          />
          <FeatureCard
            icon={<BellIcon className="w-10 h-10 text-primary-600" />}
            title="Smart Reminders"
            description="Automated notifications for deadlines, streak maintenance, and achievement milestones."
          />
        </div>

        {/* Roles */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Built for Everyone</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <RoleCard
              title="👨‍👩‍👧 Guardians"
              description="Assign tasks, review work, and monitor family progress"
              link="/guardian"
            />
            <RoleCard
              title="🎓 Learners"
              description="Complete tasks, track progress, and earn achievements"
              link="/learner"
            />
            <RoleCard
              title="⚙️ Superusers"
              description="Manage system, monitor logs, and handle accounts"
              link="/superuser"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function RoleCard({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <Link href={link} className="card hover:shadow-md transition-shadow cursor-pointer">
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  )
}
