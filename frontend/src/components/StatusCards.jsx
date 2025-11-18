import '../index.css'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// This component is reusable
// Use this format to pass values to the cards prop
// const cards_content = [
//     {
//       title: "Active Trucks",
//       value: "8",
//       subtitle: "out of 10 total",
//       icon: Truck,
//       color: "text-chart-1",
//     },
//     {
//       title: "Employees",
//       value: "24",
//       subtitle: "drivers & helpers",
//       icon: Users,
//       color: "text-chart-2",
//     },
//     {
//       title: "Today's Deliveries",
//       value: "12",
//       subtitle: "3 pending",
//       icon: Package,
//       color: "text-chart-3",
//     },
//     {
//       title: "Monthly Revenue",
//       value: "₱485K",
//       subtitle: "+12% from last month",
//       icon: DollarSign,
//       color: "text-chart-4",
//     },
//   ]

export default function StatusCards({ cards }) {

    return (
        <>
            {/* This dynamically generates the cards from the cards array */}
            {cards.map((card, index) => {
                const Icon = card.icon;

                return (
                    <Card key={index} className="hover:shadow-[var(--shadow-md),0_4px_16px_var(--accent)] transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-md sm:text-base font-medium text-muted-foreground">{card.title}</CardTitle>
                        <card.icon className={`h-6 w-6 ${card.color}`} />
                      </CardHeader>
                      <CardContent className="sm:mt-6">
                        <div className="text-lg sm:text-2xl font-bold text-foreground">{card.value}</div>
                        <p className="text-sm text-muted-foreground mt-1">{card.subtitle}</p>
                      </CardContent>
                    </Card>
                ) 
            })}
        </>
    )
}
