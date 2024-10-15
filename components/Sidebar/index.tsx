'use client'

import { Flex, Text, Button } from '@radix-ui/themes'
import { QuestionMarkIcon } from '@radix-ui/react-icons'
import { SlSupport } from 'react-icons/sl'
import { FaGithub } from 'react-icons/fa6'
import { IoExtensionPuzzleOutline } from 'react-icons/io5'

import React from 'react'
import NextLink from 'next/link'
import cs from 'classnames'
import { FlagWith } from '../FeatureFlags/feature-flags'

/**
 * SideBar component that displays the chat list and support button.
 * @returns {JSX.Element} The rendered sidebar component.
 */
export const SideBar = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex direction="column" className={cs('chart-sider-bar')}>
      <Flex className="p-2 pb-4 h-full overflow-hidden w-64" direction="column" gap="3">
        {children}
        <Flex className="w-full" direction="column" gap="1">
          <FlagWith flag="PLUGIN_PAGE">
            <NextLink href="/plugins">
              <ButtonWrapper>
                <IoExtensionPuzzleOutline />
                <Text>Plugins</Text>
              </ButtonWrapper>
            </NextLink>
          </FlagWith>

          <ButtonWrapper onClick={() => window.open('mailto:hq-dl-madi@mail.nasa.gov', '_blank')}>
            <SlSupport />
            <Text>Support</Text>
          </ButtonWrapper>

          <FlagWith flag="FAQ_PAGE">
            <ButtonWrapper onClick={() => window.open('mailto:hq-dl-madi@mail.nasa.gov', '_blank')}>
              <QuestionMarkIcon />
              <Text>FAQs</Text>
            </ButtonWrapper>
          </FlagWith>

          <ButtonWrapper
            onClick={() => window.open('https://nasa-madi.github.io/madi-core/', '_blank')}
          >
            <FaGithub />
            <Text>Documentation</Text>
          </ButtonWrapper>
        </Flex>
        <Text color="gray" size="1" align={'center'} className="pr-6 pt-4">
          Sponsored by{' '}
          <a href="https://www.nasa.gov/directorates/armd/tacp/cas/" className="underline">
            NASA CAS
          </a>
        </Text>
      </Flex>
    </Flex>
  )
}

const ButtonWrapper = ({
  children,
  onClick
}: {
  children: React.ReactNode
  onClick?: () => void
}) => (
  <Button
    size={'3'}
    variant="outline"
    color="gray"
    className="flex gap-2 py-1 px-4 justify-start cursor-pointer shadow-none"
    onClick={onClick}
  >
    {children}
  </Button>
)

export default SideBar
