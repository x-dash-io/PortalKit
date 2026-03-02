import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64 bg-white/5" />
                    <Skeleton className="h-4 w-48 bg-white/5" />
                </div>
                <Skeleton className="h-11 w-32 bg-white/5 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="glass-card border-white/5 opacity-50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20 bg-white/5" />
                                <Skeleton className="h-8 w-16 bg-white/5" />
                            </div>
                            <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-40 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="glass-card border-white/5 opacity-50">
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-4 w-16 bg-white/5" />
                                <Skeleton className="h-6 w-48 bg-white/5" />
                                <Skeleton className="h-4 w-32 bg-white/5" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
