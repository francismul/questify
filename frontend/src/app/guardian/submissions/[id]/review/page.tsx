export default function ReviewSubmissionPage({ params }: { params: { id: string } }) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Review Submission</h1>
            <p className="text-gray-500">Reviewing submission ID: {params.id}</p>
            <div className="mt-4 p-4 border rounded bg-gray-50">
                Review interface coming soon.
            </div>
        </div>
    )
}
