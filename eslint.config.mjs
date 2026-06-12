import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import html from '@html-eslint/eslint-plugin'
import json from '@eslint/json'

const customHtml = {
  rules: {
    'require-main': {
      meta: { type: 'problem', schema: [] },
      create(context) {
        let mainFound = false
        return {
          Tag(node) {
            if (node.name === 'main') {
              mainFound = true
            }
          },
          'Program:exit'(node) {
            if (!mainFound) {
              context.report({ node, message: 'Page must contain a <main> element' })
            }
          },
        }
      },
    },
    'no-javascript-href': {
      meta: { type: 'problem', schema: [] },
      create(context) {
        return {
          Tag(node) {
            if (node.name !== 'a' || !Array.isArray(node.attributes)) {
              return
            }

            const hrefAttr = node.attributes.find((attr) => attr?.key?.value === 'href' && typeof attr?.value?.value === 'string')

            if (!hrefAttr) {
              return
            }

            const hrefValue = hrefAttr.value.value.trim().toLowerCase()
            if (hrefValue.startsWith('javascript:')) {
              context.report({
                node: hrefAttr,
                message: 'Anchor href cannot use javascript: URLs (e.g. javascript:void(0)).',
              })
            }
          },
        }
      },
    },
  },
}

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'module' } },
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.browser } },
  {
    files: ['.husky/scripts/**/*.mjs', '.husky/scripts/**/*.js'],
    languageOptions: { globals: { ...globals.node, process: 'readonly' } },
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    rules: {
      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-use-before-define': 'error',
      'no-duplicate-imports': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['.prettierrc'],
    plugins: { json },
    language: 'json/json',
    rules: {
      'json/no-duplicate-keys': 'error',
    },
  },
  {
    files: ['**/*.html'],
    plugins: { '@html-eslint': html, custom: customHtml },
    extends: [html.configs['flat/recommended']],
    rules: {
      '@html-eslint/no-duplicate-id': 'error',
      '@html-eslint/no-multiple-empty-lines': 'error',
      '@html-eslint/indent': 'off',
      '@html-eslint/no-extra-spacing-tags': 'off',
      '@html-eslint/require-img-alt': 'error',
      '@html-eslint/require-attrs': [
        'error',
        { tag: 'a', attr: 'href' },
        { tag: 'a', attr: 'role', value: 'link' },
        { tag: 'a', attr: 'aria-label' },
        { tag: 'a', attr: 'target' },
        { tag: 'button', attr: 'type' },
        { tag: 'button', attr: 'aria-label' },
        { tag: 'img', attr: 'width' },
        { tag: 'img', attr: 'height' },
        { tag: 'img', attr: 'loading', value: 'lazy' },
        { tag: 'video', attr: 'width' },
        { tag: 'video', attr: 'height' },
        { tag: 'video', attr: 'playsinline' },
        { tag: 'video', attr: 'preload' },
      ],
      '@html-eslint/no-multiple-h1': 'error',
      '@html-eslint/require-closing-tags': 'off',
      'custom/require-main': 'error',
      'custom/no-javascript-href': 'error',
    },
  },
])
