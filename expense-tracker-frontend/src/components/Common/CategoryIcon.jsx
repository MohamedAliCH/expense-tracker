import React from "react";
import {
  ForkKnife,
  Car,
  ShoppingBag,
  Lightning,
  FirstAidKit,
  GameController,
  Coins,
  Briefcase,
  ChartLineUp,
  House,
  AirplaneTilt,
  GraduationCap,
  Tag,
  Coffee,
  CreditCard,
  Gift,
  DeviceMobile,
  Anchor,
} from "@phosphor-icons/react";

export const CATEGORY_ICON_OPTIONS = [
  { key: "dining", label: "Dining", Icon: ForkKnife },
  { key: "transport", label: "Transport", Icon: Car },
  { key: "shopping", label: "Shopping", Icon: ShoppingBag },
  { key: "utilities", label: "Utilities", Icon: Lightning },
  { key: "health", label: "Health", Icon: FirstAidKit },
  { key: "entertainment", label: "Leisure", Icon: GameController },
  { key: "income", label: "Income", Icon: Coins },
  { key: "work", label: "Business", Icon: Briefcase },
  { key: "investments", label: "Growth", Icon: ChartLineUp },
  { key: "housing", label: "Housing", Icon: House },
  { key: "travel", label: "Travel", Icon: AirplaneTilt },
  { key: "education", label: "Education", Icon: GraduationCap },
  { key: "coffee", label: "Daily", Icon: Coffee },
  { key: "subscription", label: "Billing", Icon: CreditCard },
  { key: "gifts", label: "Gifts", Icon: Gift },
  { key: "marine", label: "Marine", Icon: Anchor },
];

const LEGACY_MAP = {
  "🍽️": ForkKnife,
  "🚗": Car,
  "🛍️": ShoppingBag,
  "💡": Lightning,
  "🏥": FirstAidKit,
  "🎮": GameController,
  "💰": Coins,
  "💼": Briefcase,
  "📈": ChartLineUp,
  "🏠": House,
  "✈️": AirplaneTilt,
  "🎓": GraduationCap,
  "📊": ChartLineUp,
  "☕": Coffee,
  "📱": DeviceMobile,
};

const NAME_KEYWORD_MAP = [
  { match: /food|grocer|din|restaur|coffee/i, Icon: ForkKnife },
  { match: /car|transp|uber|gas|fuel/i, Icon: Car },
  { match: /shop|cloth|retail/i, Icon: ShoppingBag },
  { match: /util|bill|electr|water|internet/i, Icon: Lightning },
  { match: /health|med|doctor|pharm/i, Icon: FirstAidKit },
  { match: /game|entert|movie|music/i, Icon: GameController },
  { match: /salar|pay|income|dividend/i, Icon: Coins },
  { match: /work|freelance|business|consult/i, Icon: Briefcase },
  { match: /invest|stock|crypto|saving/i, Icon: ChartLineUp },
  { match: /rent|house|mortg|home/i, Icon: House },
  { match: /travel|flight|hotel|vacat/i, Icon: AirplaneTilt },
  { match: /educ|course|book|tuition/i, Icon: GraduationCap },
];

const CategoryIcon = ({ iconKey, categoryName = "", size = 18, weight = "duotone", className = "" }) => {
  // 1. Direct match in icon options
  const direct = CATEGORY_ICON_OPTIONS.find((item) => item.key === iconKey);
  if (direct) {
    const IconComp = direct.Icon;
    return <IconComp size={size} weight={weight} className={className} />;
  }

  // 2. Legacy emoji mapping
  if (iconKey && LEGACY_MAP[iconKey]) {
    const LegacyComp = LEGACY_MAP[iconKey];
    return <LegacyComp size={size} weight={weight} className={className} />;
  }

  // 3. Keyword match on category name
  for (const rule of NAME_KEYWORD_MAP) {
    if (rule.match.test(categoryName)) {
      const KeywordComp = rule.Icon;
      return <KeywordComp size={size} weight={weight} className={className} />;
    }
  }

  return <Tag size={size} weight={weight} className={className} />;
};

export default CategoryIcon;

