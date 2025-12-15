export default function TaskDetailsPage({ params }: { params: { id: string } }) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Task Details</h1>
            <p className="text-gray-500">Viewing task ID: {params.id}</p>
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Submit Work</h2>
                <div className="p-4 border rounded bg-gray-50">
                    Submission form coming soon.
                </div>
            </div>
        </div>
    )
}
