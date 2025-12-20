// utils/theme.ts

export const theme = {
    colors: {
      // Backgrounds
      bg: {
        primary: '#0a0a0a',
        card: '#1a1a2e',
        cardSecondary: '#16213e',
        input: '#333',
      },
      
      // Users (préparé pour équipe)
      users: {
        primary: '#5FE3D9',    // Cyan (user 1 / toi pour l'instant)
        secondary: '#FF8A80',  // Corail (user 2 / futur coéquipier)
        victory: '#BA76D9',    // Violet (victoire)
      },
      
      // UI
      text: {
        primary: '#ffffff',
        secondary: '#B0B0B0',
        tertiary: '#999999',
        muted: '#666666',
      },
      
      // Status
      success: '#4caf50',
      error: '#FF6B6B',
      warning: '#ffd700',
      
      // Borders
      border: 'rgba(255, 255, 255, 0.15)',
      borderLight: 'rgba(255, 255, 255, 0.12)',
    },
    
    gradients: {
      background: ['#0f2027', '#203a43', '#2c5364'],
      card: ['#1a1a2e', '#16213e'],
      countdown: ['#5FE3D9', '#FF8A80'],
      victory: ['#BA76D9', '#9B6FD9'],
    },
    
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  };
  
  export type Theme = typeof theme;