export const DASHBOARD_SIDEBAR_ITEMS = [
  {
    label: "Lead Management",
    items: [
      {
        key: "tasks",
        href: "/tasks",
        icon: "solar:tasks-bold-duotone",
        activeIcon: "solar:tasks-bold",
        label: "My Tasks",
      },
      {
        key: "leads ",
        href: "/leads",
        icon: "solar:library-bold-duotone",
        activeIcon: "solar:library-bold",
        label: "Leads",
      },
      {
        key: "phone-calls",
        href: "/phone-calls",
        icon: "solar:phone-bold-duotone",
        activeIcon: "solar:phone-bold",
        label: "Phone Calls",
      },
    ],
  },
  {
    label: "Workflows",
    items: [
      {
        key: "automations",
        href: "/automations",
        icon: "solar:automation-bold-duotone",
        activeIcon: "solar:automation-bold",
        label: "Automations",
      },
      {
        key: "meetings",
        href: "/meetings",
        icon: "solar:meeting-bold-duotone",
        activeIcon: "solar:meeting-bold",
        label: "Meetings",
      },
      {
        key: "invoives",
        href: "/invoives",
        icon: "solar:invoice-bold-duotone",
        activeIcon: "solar:invoice-bold",
        label: "Invoives",
      },
    ],
  },
];

export const DASHBOARD_FOOTER_ITEMS = [
  {
    key: "custom-forms",
    href: "/custom-forms",
    icon: "solar:form-bold-duotone",
    activeIcon: "solar:form-bold",
    label: "Custom Forms",
  },
  {
    key: "integrations",
    href: "/integrations",
    icon: "solar:integrations-bold-duotone",
    activeIcon: "solar:integrations-bold",
    label: "Integrations",
  },
  {
    key: "settings",
    href: "/settings",
    icon: "solar:settings-bold-duotone",
    activeIcon: "solar:settings-bold",
    label: "Settings",
  },
];
