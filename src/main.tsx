import * as React from 'react'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import * as ReactDOM from 'react-dom/client'
import App from './App'
import { Provider } from 'react-redux'
import store from './store'
import theme from './theme'
import LanguageProvider from './i18n/LanguageProvider'

const rootElement = document.getElementById('root')
ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    {/* Menerapkan tema tersimpan sebelum aplikasi tampil, supaya pengguna
        mode terang tidak melihat kilasan gelap saat halaman dibuka. */}
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <Provider store={store}>
        <ChakraProvider theme={theme}>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </ChakraProvider>
    </Provider>
  </React.StrictMode>
)
