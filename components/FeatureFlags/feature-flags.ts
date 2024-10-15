import { ReactElement } from 'react'
import dynamic from 'next/dynamic'
import FLAGS from '@/feature-flags.json'

const getEnv = () => {
  const hostname = window.location.hostname
  console.log(hostname)
  if (hostname.startsWith('localhost')) return 'develop'
  if (hostname.startsWith('test.')) return 'test'
  if (hostname.startsWith('dev.')) return 'develop'
  return 'production'
}

interface FeatureFlags {
  [key: string]: {
    [key: string]: boolean
  }
}

function getFlag(name: string): boolean {
  return (FLAGS as FeatureFlags)?.[getEnv()]?.[name] ?? false
}

const createFlagComponent = (condition: (flag: string) => boolean) =>
  dynamic(
    () =>
      import('react').then(() => ({
        default: ({ flag, children }: { flag: string; children: ReactElement }) => {
          if (condition(flag)) {
            return children
          }
          return null
        }
      })),
    { ssr: false }
  )

export const FlagWith = createFlagComponent(getFlag)
export const FlagWithout = createFlagComponent((flag) => !getFlag(flag))
