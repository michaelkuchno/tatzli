import { Illustration } from '@/illustrations/registry'

export function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-32 w-32 animate-bounce">
        <Illustration name="tatzli" className="h-full w-full" />
      </div>
    </div>
  )
}
