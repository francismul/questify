export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to Questify</h2>
                <div className="mt-8 space-y-6">
                    <button className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Sign in with Keycloak
                    </button>
                </div>
            </div>
        </div>
    )
}
