import { useContext } from 'react'
import { ThemeContext } from './ThemeContext'
import { UseThemeProps } from './interface'

const defaultContext: UseThemeProps = { setTheme: () => {}, themes: [] }

export const useTheme = () => useContext(ThemeContext) ?? defaultContext
