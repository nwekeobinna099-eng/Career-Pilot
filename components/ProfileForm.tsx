'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'

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

export default function ProfileForm() {
    const [profile, setProfile] = useState({
        fullName: '',
        age: '',
        education: [{ institution: '', degree: '', year: '' }] as Education[],
        experience: [{ company: '', role: '', duration: '', description: '' }] as WorkExperience[],
        skills: [] as string[],
        certifications: [] as string[],
        languages: [] as string[],
    })

    const [newSkill, setNewSkill] = useState('')
    const [newCert, setNewCert] = useState('')
    const [newLang, setNewLang] = useState('')

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
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={profile.fullName}
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 opacity-80">Age</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={profile.age}
                            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                            placeholder="25"
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
                            <div key={idx} className="relative p-4 bg-white/5 rounded-xl border border-white/5 group">
                                <button
                                    onClick={() => handleRemoveEducation(idx)}
                                    className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        placeholder="Institution"
                                        className="bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-blue-500"
                                        value={edu.institution}
                                        onChange={(e) => {
                                            const newEdu = [...profile.education]
                                            newEdu[idx].institution = e.target.value
                                            setProfile({ ...profile, education: newEdu })
                                        }}
                                    />
                                    <input
                                        placeholder="Degree"
                                        className="bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-blue-500"
                                        value={edu.degree}
                                        onChange={(e) => {
                                            const newEdu = [...profile.education]
                                            newEdu[idx].degree = e.target.value
                                            setProfile({ ...profile, education: newEdu })
                                        }}
                                    />
                                    <input
                                        placeholder="Year"
                                        className="bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-blue-500"
                                        value={edu.year}
                                        onChange={(e) => {
                                            const newEdu = [...profile.education]
                                            newEdu[idx].year = e.target.value
                                            setProfile({ ...profile, education: newEdu })
                                        }}
                                    />
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
                            <div key={idx} className="relative p-4 bg-white/5 rounded-xl border border-white/5 group">
                                <button
                                    onClick={() => handleRemoveExperience(idx)}
                                    className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <input
                                        placeholder="Company"
                                        className="bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-purple-500"
                                        value={exp.company}
                                        onChange={(e) => {
                                            const newExp = [...profile.experience]
                                            newExp[idx].company = e.target.value
                                            setProfile({ ...profile, experience: newExp })
                                        }}
                                    />
                                    <input
                                        placeholder="Role"
                                        className="bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-purple-500"
                                        value={exp.role}
                                        onChange={(e) => {
                                            const newExp = [...profile.experience]
                                            newExp[idx].role = e.target.value
                                            setProfile({ ...profile, experience: newExp })
                                        }}
                                    />
                                    <input
                                        placeholder="Duration"
                                        className="bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-purple-500"
                                        value={exp.duration}
                                        onChange={(e) => {
                                            const newExp = [...profile.experience]
                                            newExp[idx].duration = e.target.value
                                            setProfile({ ...profile, experience: newExp })
                                        }}
                                    />
                                </div>
                                <textarea
                                    placeholder="Job Description / Achievements"
                                    className="w-full bg-transparent border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[100px]"
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

                {/* Tags Sections: Skills, Certs, Languages */}
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
                                    className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-2 border border-white/10"
                                >
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tagGroup.field, idx)}>
                                        <Trash2 size={12} className="hover:text-red-400" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder={`Add ${tagGroup.label}...`}
                                value={tagGroup.value}
                                onChange={(e) => tagGroup.setter(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(tagGroup.field, tagGroup.value, tagGroup.setter)}
                            />
                            <button
                                onClick={() => handleAddTag(tagGroup.field, tagGroup.value, tagGroup.setter)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </section>
                ))}

                <div className="pt-8 border-t border-white/10">
                    <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02]">
                        <Save size={20} /> Save Profile
                    </button>
                </div>
            </div>
        </div>
    )
}
