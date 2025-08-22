import {
  LucideIcon,
  Calendar,
  Home,
  Mail,
  MessageSquare,
  FileText,
  ExternalLink,
  ChartCandlestick,
} from 'lucide-react';

export interface MenuItem {
  label: string;
  id?: number;
  icon?: LucideIcon;
  link?: string;
  isExternalLink?: boolean;
  expanded?: boolean;
  subItems?: MenuItem[];
  isTitle?: boolean;
  badge?: { variant: string; isDarkText?: boolean; isPill?: boolean; text: string };
  parentId?: number;
}

export const MENU: MenuItem[] = [
  {
    label: 'Main dashboard',
    isTitle: true,
  },
  {
    label: 'Dashboard',
    icon: Home,
    link: '/dashboard',
  },
  {
    label: 'Program Reports',
    isTitle: true,
  },
  {
    label: 'Monthly Report',
    icon: ChartCandlestick,
    subItems: [
      {
        label: 'Weekly Reports',
        link: '/reports/weeklyreport',
      },
      {
        label: 'Monthly Reports',
        link: '/reports/monthlyreport',
      },
       {
        label: 'Concodance Report',
        link: 'reports/concodancereport',
      }
      
    ],
  },
  {
    label: 'Program Narrations',
    icon: MessageSquare,
    link: '/apps/chat',
  },
  {
    label: 'Weekly Calendar',
    icon: Calendar,
    link: '/apps/calendar',
    // badge: {
    //   variant: 'primary',
    //   isDarkText: false,
    //   isPill: false,
    //   text: 'Event',
    // },
  },
  {
    label: 'Tools',
    isTitle: true,
  },
  {
    label: 'Data Upload',
    icon: FileText,
    subItems: [
      {
        label: 'TPDF-Warehouse',
        link: 'datapipelines/tpdfwarehouse',
      },
      {
        label: 'IMPACT Data',
        link: '/form-elements/form-control',
      },
      {
        label: 'DATIM Data',
        link: '/form-elements/form-text',
      },
      {
        label: 'Data Validation',
        link: '/form-elements/validation',
      },
    ],
  },

  {
    label: 'Other',
    isTitle: true,
  },
  {
    isExternalLink: true,
    label: 'DATIM Help',
    icon: ExternalLink,
    link: '#',
  },
    {
    isExternalLink: true,
    label: 'HJFMRI Data Portal',
    icon: ExternalLink,
    link: '#',
  },
  {
    label: 'Docs',
    isTitle: true,
  },
  {
  label: 'Monthly Report',
  icon: Mail,
  subItems: [
    {
      label: 'SOPs',
      link: '/apps/email/inbox',
    },
  ],
}
];
