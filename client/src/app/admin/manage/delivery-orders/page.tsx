"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck } from "lucide-react";
import OrdersTab from "./OrdersTab";
import DeliverySettingsTab from "./DeliverySettingsTab";

export default function DeliveryManagementPage() {
    return (
        <div className="p-4 md:p-8 space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-headline font-semibold flex items-center gap-3">
                    <Truck className="h-8 w-8 text-primary" /> Delivery Management
                </h1>
                <p className="text-muted-foreground mt-2">Manage student delivery orders and configure delivery packages.</p>
            </header>

            <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="orders">
                        <Truck className="w-4 h-4 mr-2" /> Orders
                    </TabsTrigger>
                    <TabsTrigger value="packages">
                        <Package className="w-4 h-4 mr-2" /> Packages
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="mt-6">
                    <OrdersTab />
                </TabsContent>
                
                <TabsContent value="packages" className="mt-6">
                    <DeliverySettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
