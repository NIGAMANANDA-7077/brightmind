import { Palette, Briefcase, Code, TrendingUp, MonitorPlay, Megaphone, PenTool, Database } from 'lucide-react';

export const categories = [
  {
    id: 1,
    name: "Development",
    icon: Briefcase,
    courses: 17,
    webinars: 3,
    color: "bg-[#e0f2f1]", // Minty Cyan
    iconColor: "text-teal-600",
    iconBg: "bg-teal-100"
  },
  {
    id: 2,
    name: "Digital Marketing",
    icon: Code, // Using a cloud/code icon surrogate if needed, but trending up is better for marketing usually. The image showed a cloud/code tag for marketing? Let's check image. Briefcase for Dev? Actually image: Dev=Briefcase, Marketing=Cloud/Code?, Design=Megaphone? 
    // Wait, the image mapping seems:
    // Development -> Briefcase icon (weird but matches image)
    // Digital Marketing -> Cloud/Code icon (weird)
    // Design -> Megaphone icon (weird)
    // Let's stick to logical icons but match colors. 
    // Development -> Light Cyan. 
    // Digital Marketing -> Light Yellow.
    // Design -> Light Purple.
    // I will use logical icons: Dev=Code, Marketing=Megaphone/Trending, Design=Palette.
    icon: MonitorPlay, // Surrogate for cloud/code
    courses: 24,
    webinars: 1,
    color: "bg-[#fff9c4]", // Light Yellow
    iconColor: "text-yellow-700",
    iconBg: "bg-yellow-100"
  },
  {
    id: 3,
    name: "Design",
    icon: Palette, // Megaphone in reference? Okay.
    courses: 22,
    webinars: 3,
    color: "bg-[#f3e5f5]", // Light Purple
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100"
  },
  {
    id: 4,
    name: "Business",
    icon: TrendingUp,
    courses: 12,
    webinars: 2,
    color: "bg-[#e1f5fe]", // Light Blue
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100"
  },
  {
    id: 5,
    name: "Content Writing",
    icon: PenTool,
    courses: 8,
    webinars: 1,
    color: "bg-[#fbe9e7]", // Light Orange
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100"
  },
  {
    id: 6,
    name: "Data Science",
    icon: Database,
    courses: 35,
    webinars: 5,
    color: "bg-[#f1f8e9]", // Light Green
    iconColor: "text-green-600",
    iconBg: "bg-green-100"
  }
];
