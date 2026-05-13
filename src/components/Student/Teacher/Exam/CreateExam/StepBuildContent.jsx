import BankSelector from './BankSelector'
import DocxImporter from './DocxImporter.jsx'
import JsonImporter from './JsonImporter.jsx'
import ManualBuilder from './ManualBuilder.jsx'

export default function StepBuildContent({ method, metadata, sections, setSections }) {
    switch (method) {
        case 'manual':
            return (
                <ManualBuilder metadata={metadata} sections={sections} setSections={setSections} />
            )
        case 'bank':
            return (
                <BankSelector metadata={metadata} sections={sections} setSections={setSections} />
            )
        case 'docx':
            return (
                <DocxImporter metadata={metadata} sections={sections} setSections={setSections} />
            )
        case 'json':
            return (
                <JsonImporter metadata={metadata} sections={sections} setSections={setSections} />
            )
        default:
            return (
                <div className="py-20 text-center text-sm text-[#94A3B8]">
                    Vui lòng chọn phương thức tạo đề thi ở bước 2
                </div>
            )
    }
}