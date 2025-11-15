// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'customLight',
    themes: {
      customLight: {
        dark: false,
        colors: {
          'highlight': '#1D0C59',
          'on-highlight': '#e4e4e4',
          'primary': '#1E88E5',
          'error': '#E53935',
          'hard-constraint': '#0D47A1',
          'soft-constraint': '#90CAF9',
          'on-soft-constraint': '#90CAF9',
          'background': '#F2F2F2'
        },
      },
      customDark: {
        dark: true,
        colors: {
          'highlight': '#4A37A0', 
          'on-highlight': '#F0F0F5',
          'primary': '#0268ba', 
          'on-primary': '#0A0A0A',
          'error': '#EF5350',  
          'on-error': '#1E1E1E',
          'hard-constraint': '#1565C0', 
          'soft-constraint': '#BBDEFB',
          'on-soft-constraint': '#0D0D0D',
          'background': '#121212',
          'surface': '#1E1E1E',
        },
      },
    }
  },
})