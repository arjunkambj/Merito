export const DASHBOARD_SIDEBAR_ITEMS = [
  {
    label: "Lead Management",
    items: [
      {
        key: "tasks",
        href: "/tasks",
        icon: "solar:checklist-bold-duotone",
        activeIcon: "solar:checklist-bold",
        label: "My Tasks",
      },
      {
        key: "leads ",
        href: "/leads",
        icon: "solar:users-group-two-rounded-bold-duotone",
        activeIcon: "solar:users-group-two-rounded-bold",
        label: "Leads",
      },
      {
        key: "phone-calls",
        href: "/phone-calls",
        icon: "solar:phone-calling-bold-duotone",
        activeIcon: "solar:phone-calling-bold",
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
        icon: "solar:widget-5-bold-duotone",
        activeIcon: "solar:widget-5-bold",
        label: "Automations",
      },
      {
        key: "meetings",
        href: "/meetings",
        icon: "solar:calendar-bold-duotone",
        activeIcon: "solar:calendar-bold",
        label: "Meetings",
      },
      {
        key: "invoives",
        href: "/invoives",
        icon: "solar:document-text-bold-duotone",
        activeIcon: "solar:document-text-bold",
        label: "Invoives",
      },
    ],
  },
];

export const DASHBOARD_FOOTER_ITEMS = [
  {
    key: "custom-forms",
    href: "/custom-forms",
    icon: "solar:clipboard-list-bold-duotone",
    activeIcon: "solar:clipboard-list-bold",
    label: "Custom Forms",
  },
  {
    key: "integrations",
    href: "/integrations",
    icon: "solar:widget-bold-duotone",
    activeIcon: "solar:widget-bold",
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
