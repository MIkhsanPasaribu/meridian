import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { RegisterForm } from "@/features/authentication"
import { AuthPageWrapper } from "../_components/AuthPageWrapper"

export const metadata: Metadata = {
  title: "Create Organization — Meridian",
}

/**
 * Registration page for new organizations.
 */
export default function RegisterPage() {
  return (
    <AuthPageWrapper>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="/meridian-logo-withtext.png"
            alt="Meridian"
            width={180}
            height={120}
            className="h-auto w-40 object-contain"
            priority
          />
        </div>

        <div className="bg-[#0E1117] border border-[#1E2737] rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#E8EDF5]">Create your organization</h1>
            <p className="text-sm text-[#8B9BB4] mt-1">
              Start monitoring your supply chain in minutes
            </p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-[#8B9BB4]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthPageWrapper>
  )
}
