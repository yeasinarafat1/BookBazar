import { Card, CardContent } from "@/components/ui/card";


const StatsCard = ({ label, count, icon: Icon, color }: any) => (
  <Card
    className={`border-0 shadow-lg bg-linear-to-br from-${color}-500 to-${color}-600 text-white overflow-hidden relative`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
    <CardContent className="p-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-100 text-sm font-medium mb-1`}>
            {label}
          </p>
          <p className="text-4xl font-bold">{count}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StatsCard;
