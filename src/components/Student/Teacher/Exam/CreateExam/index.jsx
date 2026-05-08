import { examService } from '@/services/ExamService'
import { ArrowLeft, ArrowRight, Check, Loader2, Save } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    buildExamPayload,
    countTotalQuestions,
    createEmptySection,
    DEFAULT_EXAM_FORM,
    JLPT_SECTIONS,
    WIZARD_STEPS,
} from './constants'
import StepBuildContent from './StepBuildContent.jsx'
import StepMetadata from './StepMetadata.jsx'
import StepMethodSelect from './StepMethodSelect.jsx'
import StepPreview from './StepPreview.jsx'
import WizardStepper from './WizardStepper.jsx'

export default function CreateExamWizard() {
    const navigate = useNavigate()

    /* ── state ── */
    const [currentStep, setCurrentStep] = useState(1)
    const [method, setMethod] = useState(null) // manual | bank | docx | json
    const handleSetMethod = useCallback(m => {
        setMethod(m)
        // Auto-advance to step 3 after choosing method
        setCurrentStep(3)
    }, [])
    const [metadata, setMetadata] = useState({ ...DEFAULT_EXAM_FORM })
    const [sections, setSections] = useState(
        JLPT_SECTIONS.map((s, i) => createEmptySection(s, i + 1))
    )
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const totalQuestions = useMemo(() => countTotalQuestions(sections), [sections])

    /* ── navigation ── */
    const canGoNext = useMemo(() => {
        if (currentStep === 1)
            return metadata.title.trim() && metadata.level && metadata.duration > 0
        if (currentStep === 2) return !!method
        if (currentStep === 3) return totalQuestions > 0
        return true
    }, [currentStep, method, metadata, totalQuestions])

    const goNext = useCallback(() => {
        if (canGoNext && currentStep < 4) setCurrentStep(s => s + 1)
    }, [canGoNext, currentStep])

    const goPrev = useCallback(() => {
        if (currentStep > 1) setCurrentStep(s => s - 1)
    }, [currentStep])

    const goToStep = useCallback(
        step => {
            // Chỉ cho nhảy tới step <= current hoặc step đã hoàn thành
            if (step <= currentStep) setCurrentStep(step)
        },
        [currentStep]
    )

    /* ── save ── */
    const handleSave = useCallback(
        async (status = 'draft') => {
            setSaving(true)
            setError(null)
            try {
                const payload = buildExamPayload(metadata, sections)
                payload.status = status
                const res = await examService.createExam(payload)
                if (res.success) {
                    navigate('/creator/exam')
                } else {
                    setError(res.message || 'Có lỗi xảy ra khi lưu đề thi')
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra')
            } finally {
                setSaving(false)
            }
        },
        [metadata, sections, navigate]
    )

    /* ── render step content ── */
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepMetadata metadata={metadata} setMetadata={setMetadata} />
            case 2:
                return <StepMethodSelect method={method} setMethod={handleSetMethod} />
            case 3:
                return (
                    <StepBuildContent
                        method={method}
                        metadata={metadata}
                        sections={sections}
                        setSections={setSections}
                    />
                )
            case 4:
                return (
                    <StepPreview
                        metadata={metadata}
                        sections={sections}
                        totalQuestions={totalQuestions}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
            {/* ── Header ── */}
            <div className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                    <button
                        onClick={() => navigate('/creator/exam')}
                        className="flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#1E293B] cursor-pointer"
                    >
                        <ArrowLeft className="size-4" />
                        Quản lý đề thi
                    </button>

                    <h1 className="text-base font-bold text-[#1E293B]">Tạo đề thi mới</h1>

                    <div className="flex items-center gap-2">
                        {totalQuestions > 0 && (
                            <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-semibold text-[#2563EB]">
                                {totalQuestions} câu hỏi
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Stepper ── */}
                <WizardStepper
                    steps={WIZARD_STEPS}
                    currentStep={currentStep}
                    onStepClick={goToStep}
                    completedUntil={currentStep}
                />
            </div>

            {/* ── Body ── */}
            <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">{renderStep()}</div>

            {/* ── Footer ── */}
            <div className="sticky bottom-0 border-t border-[#E2E8F0] bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                    <button
                        onClick={goPrev}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                        <ArrowLeft className="size-4" />
                        Quay lại
                    </button>

                    {error && <p className="text-sm font-medium text-red-500">{error}</p>}

                    <div className="flex items-center gap-3">
                        {currentStep === 4 && (
                            <button
                                onClick={() => handleSave('draft')}
                                disabled={saving}
                                className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F1F5F9] disabled:opacity-50 cursor-pointer"
                            >
                                {saving ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Save className="size-4" />
                                )}
                                Lưu nháp
                            </button>
                        )}

                        {currentStep < 4 ? (
                            <button
                                onClick={goNext}
                                disabled={!canGoNext}
                                className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                            >
                                Tiếp theo
                                <ArrowRight className="size-4" />
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSave('draft')}
                                disabled={saving || totalQuestions === 0}
                                className="flex items-center gap-2 rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                            >
                                {saving ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Check className="size-4" />
                                )}
                                Tạo đề thi
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}