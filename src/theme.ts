import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'xl',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        transition: 'all 0.2s',
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'xl',
        },
      },
    },
    Box: {
      baseStyle: {
        borderRadius: 'xl',
        transition: 'all 0.2s',
      },
    },
  },
});

export default theme; 