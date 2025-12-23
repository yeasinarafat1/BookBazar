import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30'>
      

      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#10b981',
            colorBackground: '#ffffff',
            colorText: '#111827',
            colorTextSecondary: '#6b7280',
            colorInputBackground: '#ffffff',
            colorInputText: '#111827',
            borderRadius: '0.75rem',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          },
          elements: {
            card: 'bg-white shadow-lg border border-gray-100',
            headerTitle: 'text-gray-900 font-bold',
            headerSubtitle: 'text-gray-600',
            socialButtonsBlockButton: 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors',
            socialButtonsBlockButtonText: 'font-medium',
            formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors',
            formFieldInput: 'border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
            formFieldLabel: 'text-gray-700 font-medium',
            footerActionLink: 'text-emerald-600 hover:text-emerald-700 font-semibold',
            footerActionText: 'text-gray-600',
            dividerLine: 'bg-gray-200',
            dividerText: 'text-gray-500',
          },
        }}
      />
    </div>
  )
}