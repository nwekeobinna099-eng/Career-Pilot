import ProfileForm from '@/components/ProfileForm'
import FileUpload from '@/components/FileUpload'

export default function ProfilePage() {
    return (
        <main className="min-h-screen bg-[#0a0a0c] py-12 px-4 selection:bg-blue-500/30">
            <div className="max-w-4xl mx-auto mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                    Universal Profile
                </h1>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">
                    Keep your base experience and certifications up to date. We use this information to tailor every application you make.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-12">
                <section className="max-w-4xl mx-auto w-full">
                    <FileUpload onUploadComplete={(url) => console.log('CV Uploaded:', url)} />
                </section>

                <ProfileForm />
            </div>
        </main>
    )
}
