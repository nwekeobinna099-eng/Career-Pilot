'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface WorkExperience {
    company: string
    role: string
    duration: string
    description: string
}

interface Education {
    institution: string
    degree: string
    year: string
}

export default function ProfileForm({ externalData }: { externalData?: any }) {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        fullName: '',
        age: '',
        email: '',
        phone: '',
        address: '',
        linkedinUrl: '',
        portfolioUrl: '',
        education: [{ institution: '', degree: '', year: '' }] as Education[],
        experience: [{ company: '', role: '', duration: '', description: '' }] as WorkExperience[],
        skills: [] as string[],
        certifications: [] as string[],
        languages: [] as string[],
    })

    useEffect(() => {
        if (externalData) {
            setProfile({
                fullName: externalData.full_name || '',
                age: externalData.age?.toString() || '',
                email: externalData.email || '',
                phone: externalData.phone || '',
                address: externalData.address || '',
                linkedinUrl: externalData.linkedin_url || '',
                portfolioUrl: externalData.portfolio_url || '',
                education: externalData.educational_background || [],
                experience: externalData.work_experience || [],
                skills: externalData.skills || [],
                certifications: externalData.certifications || [],
                languages: externalData.languages || [],
            })
            alert('CV details imported successfully! ✨ Please review before saving.')
        }
    }, [externalData])

    const [newSkill, setNewSkill] = useState('')
    const [newCert, setNewCert] = useState('')
    const [newLang, setNewLang] = useState('')

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            if (data) {
                setProfile({
                    fullName: data.full_name || '',
                    age: data.age?.toString() || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    linkedinUrl: data.linkedin_url || '',
                    portfolioUrl: data.portfolio_url || '',
                    education: Array.isArray(data.educational_background) ? data.educational_background : [{ institution: '', degree: '', year: '' }],
                    experience: Array.isArray(data.work_experience) ? data.work_experience : [{ company: '', role: '', duration: '', description: '' }],
                    skills: data.skills || [],
                    certifications: data.certifications || [],
                    languages: data.languages || [],
                })
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('Please sign in to save your profile.')
                return
            }

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: profile.fullName,
                    age: profile.age ? parseInt(profile.age) : null,
                    email: profile.email,
                    phone: profile.phone,
                    address: profile.address,
                    linkedin_url: profile.linkedinUrl,
                    portfolio_url: profile.portfolioUrl,
                    educational_background: profile.education,
                    work_experience: profile.experience,
                    skills: profile.skills,
                    certifications: profile.certifications,
                    languages: profile.languages,
                })

            if (error) throw error
            alert('Profile saved successfully! ✨')
        } catch (error: any) {
            console.error('Error saving profile:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            alert('Failed to save profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleAddEducation = () => {
        setProfile({ ...profile, education: [...profile.education, { institution: '', degree: '', year: '' }] })
    }

    const handleRemoveEducation = (index: number) => {
        const newEdu = [...profile.education]
        newEdu.splice(index, 1)
        setProfile({ ...profile, education: newEdu })
    }

    const handleAddExperience = () => {
        setProfile({ ...profile, experience: [...profile.experience, { company: '', role: '', duration: '', description: '' }] })
    }

    const handleRemoveExperience = (index: number) => {
        const newExp = [...profile.experience]
        newExp.splice(index, 1)
        setProfile({ ...profile, experience: newExp })
    }

    const handleAddTag = (field: 'skills' | 'certifications' | 'languages', value: string, setter: (v: string) => void) => {
        if (value.trim()) {
            setProfile({ ...profile, [field]: [...profile[field], value.trim()] })
            setter('')
        }
    }

    const handleRemoveTag = (field: 'skills' | 'certifications' | 'languages', index: number) => {
        const newTags = [...profile[field]]
        newTags.splice(index, 1)
        setProfile({ ...profile, [field]: newTags })
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-12 glass rounded-[3rem] shadow-2xl border border-white/5 text-white flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-12 glass rounded-[3rem] shadow-2xl border border-white/5 text-white">
            <h2 className="text-4xl font-black mb-10 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase tracking-tight">
                Personal Profile
            </h2>

            <div className="space-y-8">
                {/* Basic Info */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 opacity-80">Full Name</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                            value={profile.fullName}
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 opacity-80">Age</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                            value={profile.age}
                            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                            placeholder="25"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 opacity-80">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 opacity-80">Phone Number</label>
                        <input
                            type="tel"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 opacity-80">Home Address</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            placeholder="123 Tech Lane, Silicon Valley, CA"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 opacity-80">LinkedIn Profile URL</label>
                        <input
                            type="url"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                            value={profile.linkedinUrl}
                            onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                            placeholder="https://linkedin.com/in/johndoe"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 opacity-80">Portfolio Link (Website/GitHub)</label>
                        <input
                            type="url"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                            value={profile.portfolioUrl}
                            onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                            placeholder="https://yourportfolio.com"
                        />
                    </div>
                </section>

                {/* Education */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold opacity-90">Education</h3>
                        <button
                            onClick={handleAddEducation}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-full transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {profile.education.map((edu, idx) => (
                            <div key={idx} className="relative p-6 bg-white/5 rounded-2xl border border-white/5 group">
                                <button
                                    onClick={() => handleRemoveEducation(idx)}
                                    className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-bold mb-1 opacity-50">Institution</label>
                                        <input
                                            placeholder="University of..."
                                            className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-blue-500 font-bold"
                                            value={edu.institution}
                                            onChange={(e) => {
                                                const newEdu = [...profile.education]
                                                newEdu[idx].institution = e.target.value
                                                setProfile({ ...profile, education: newEdu })
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-bold mb-1 opacity-50">Degree</label>
                                        <input
                                            placeholder="B.Sc Computer Science"
                                            className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-blue-500 font-bold"
                                            value={edu.degree}
                                            onChange={(e) => {
                                                const newEdu = [...profile.education]
                                                newEdu[idx].degree = e.target.value
                                                setProfile({ ...profile, education: newEdu })
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-bold mb-1 opacity-50">Year</label>
                                        <input
                                            placeholder="2019 - 2023"
                                            className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-blue-500 font-bold"
                                            value={edu.year}
                                            onChange={(e) => {
                                                const newEdu = [...profile.education]
                                                newEdu[idx].year = e.target.value
                                                setProfile({ ...profile, education: newEdu })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Experience */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold opacity-90">Work Experience</h3>
                        <button
                            onClick={handleAddExperience}
                            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-full transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {profile.experience.map((exp, idx) => (
                            <div key={idx} className="relative p-6 bg-white/5 rounded-2xl border border-white/5 group">
                                <button
                                    onClick={() => handleRemoveExperience(idx)}
                                    className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-bold mb-1 opacity-50">Company</label>
                                        <input
                                            placeholder="Google"
                                            className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-purple-500 font-bold"
                                            value={exp.company}
                                            onChange={(e) => {
                                                const newExp = [...profile.experience]
                                                newExp[idx].company = e.target.value
                                                setProfile({ ...profile, experience: newExp })
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-bold mb-1 opacity-50">Role</label>
                                        <input
                                            placeholder="Senior Engineer"
                                            className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-purple-500 font-bold"
                                            value={exp.role}
                                            onChange={(e) => {
                                                const newExp = [...profile.experience]
                                                newExp[idx].role = e.target.value
                                                setProfile({ ...profile, experience: newExp })
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-bold mb-1 opacity-50">Duration</label>
                                        <input
                                            placeholder="Jan 2022 - Present"
                                            className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-purple-500 font-bold"
                                            value={exp.duration}
                                            onChange={(e) => {
                                                const newExp = [...profile.experience]
                                                newExp[idx].duration = e.target.value
                                                setProfile({ ...profile, experience: newExp })
                                            }}
                                        />
                                    </div>
                                </div>
                                <label className="block text-xs uppercase tracking-wider font-bold mb-1 opacity-50">Key Achievements</label>
                                <textarea
                                    placeholder="Briefly describe your impact..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[120px] font-medium"
                                    value={exp.description}
                                    onChange={(e) => {
                                        const newExp = [...profile.experience]
                                        newExp[idx].description = e.target.value
                                        setProfile({ ...profile, experience: newExp })
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tags Sections */}
                {([
                    { label: 'Skills', field: 'skills' as const, value: newSkill, setter: setNewSkill },
                    { label: 'Certifications', field: 'certifications' as const, value: newCert, setter: setNewCert },
                    { label: 'Languages', field: 'languages' as const, value: newLang, setter: setNewLang }
                ]).map((tagGroup) => (
                    <section key={tagGroup.label}>
                        <h3 className="text-xl font-semibold mb-4 opacity-90">{tagGroup.label}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {profile[tagGroup.field].map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold flex items-center gap-2 border border-white/10 group animate-in fade-in zoom-in"
                                >
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tagGroup.field, idx)}>
                                        <Trash2 size={14} className="text-white/40 group-hover:text-red-400 transition-colors" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 focus:outline-none focus:ring-1 focus:ring-primary/50 font-bold"
                                placeholder={`Add ${tagGroup.label}...`}
                                value={tagGroup.value}
                                onChange={(e) => tagGroup.setter(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(tagGroup.field, tagGroup.value, tagGroup.setter)}
                            />
                            <button
                                onClick={() => handleAddTag(tagGroup.field, tagGroup.value, tagGroup.setter)}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl font-black transition-all shadow-lg shadow-primary/20"
                            >
                                ADD
                            </button>
                        </div>
                    </section>
                ))}

                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <Save size={24} className={`${saving ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                        {saving ? 'UPDATING PROFILE...' : 'SAVE PROFILE'}
                    </button>

                    <a
                        href="/dashboard"
                        className="py-5 px-8 glass hover:bg-white/10 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] uppercase text-white/60 hover:text-white"
                    >
                        Dashboard
                    </a>
                </div>
            </div>
        </div>
    )
}
