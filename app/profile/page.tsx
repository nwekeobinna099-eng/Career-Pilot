import ProfileForm from '@/components/ProfileForm'
import FileUpload from '@/components/FileUpload'

export default function ProfilePage() {
    return (
        <main className="min-h-screen bg-background py-24 px-4 selection:bg-primary/30">
            <div className="max-w-4xl mx-auto mb-16 text-center">
                <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent uppercase tracking-tight">
                    Universal Profile
                </h1>
                <p className="text-muted text-xl max-w-2xl mx-auto font-medium leading-relaxed">
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
