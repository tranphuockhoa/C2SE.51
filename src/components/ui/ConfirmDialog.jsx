import { AlertTriangle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Reusable confirm dialog for delete/update actions.
 *
 * Usage:
 *   <ConfirmDialog
 *     isOpen={showDelete}
 *     onClose={() => setShowDelete(false)}
 *     onConfirm={handleDelete}
 *     title="Xóa đề thi"
 *     message="Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác."
 *     confirmText="Xóa"
 *     variant="danger"   // "danger" | "warning" | "info"
 *   />
 */