"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AddSupplierModal } from "@/features/supplier"

/**
 * Add supplier page — opens the add supplier modal immediately.
 */
export default function AddSupplierPage() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  const handleClose = () => {
    setIsOpen(false)
    router.push("/supplier")
  }

  return (
    <div className="space-y-4">
      <Link
        href="/supplier"
        className="inline-flex items-center gap-2 text-sm text-[#8B9BB4] hover:text-[#E8EDF5] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Suppliers
      </Link>
      <AddSupplierModal isOpen={isOpen} onClose={handleClose} />
    </div>
  )
}
