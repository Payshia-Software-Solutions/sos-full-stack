"use client";

import { use, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDeliveryOrderById } from "@/lib/actions/delivery";
import { format } from "date-fns";

export default function PrintLabelPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const orderId = unwrappedParams.id;

    const { data: order, isLoading, error } = useQuery({
        queryKey: ['deliveryOrder', orderId],
        queryFn: () => getDeliveryOrderById(orderId),
    });

    useEffect(() => {
        if (order) {
            // Give it a moment to render images then print
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [order]);

    if (isLoading) return <div className="p-8 text-center">Loading label...</div>;
    if (error || !order) return <div className="p-8 text-center text-red-500">Failed to load order data</div>;

    const qrText = `https://pharmacollege.lk/track-order?trackingNumber=${order.tracking_number || ''}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText)}`;

    const packedDate = order.packed_date ? format(new Date(order.packed_date), 'yyyy-MM-dd HH:mm') : 'Not Set';

    return (
        <div style={{ margin: 0, padding: 0, fontFamily: "'Roboto', sans-serif" }}>
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { size: 148mm 210mm; margin: 0; }
                    body { margin: 0; padding: 0; overflow: hidden; }
                    html { overflow: hidden; }
                }
                .shipping-label {
                    width: 148mm;
                    height: 210mm;
                    overflow: hidden;
                    background-image: url('/images/shipping-label.jpg');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    padding: 1.5rem;
                    box-sizing: border-box;
                    margin: 0 auto; /* Center on screen */
                    position: relative;
                    color: black !important;
                }
                .company-title { font-size: 20px; font-weight: 700; margin-bottom: 2px; color: black !important; }
                .tracking-title { font-size: 30px; font-weight: 700; margin-bottom: 2px; text-align: center; color: black !important; }
                .mb-0 { margin-bottom: 0 !important; color: black !important; }
                .row { display: flex; flex-wrap: wrap; }
                .col-6 { flex: 0 0 50%; max-width: 50%; }
                .col-12 { flex: 0 0 100%; max-width: 100%; }
                .col-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
                .col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
                p { margin-top: 0; color: black !important; }
                h3, h4, h5, h6 { margin-top: 0; color: black !important; }
            `}} />
            
            <div className="shipping-label">
                <div className="row" style={{ marginTop: '46mm', minHeight: '33mm', maxHeight: '33mm' }}>
                    <div className="col-6">
                        <h4 className="company-title" style={{ fontSize: '15px' }}>Ceylon Pharma College</h4>
                        <p className="mb-0">Warehouse Pelmadulla</p>
                        <p className="mb-0">0715 884 884</p>
                    </div>
                    <div className="col-6">
                        <p className="mb-0">{order.full_name}</p>
                        <p className="mb-0">{order.street_address}</p>
                        <p className="mb-0">
                            {order.city || order.district ? `${order.city || ''}${order.city && order.district ? ', ' : ''}${order.district || ''}` : ''}
                        </p>
                        <p className="mb-0">{order.phone_1}{order.phone_2 ? `, ${order.phone_2}` : ''}</p>
                    </div>
                </div>

                <div className="row" style={{ marginTop: '10mm' }}>
                    <div className="col-12 text-center">
                        <h3 className="tracking-title">{order.tracking_number || 'N/A'}</h3>
                    </div>
                </div>

                <div className="row" style={{ paddingLeft: '50mm', marginTop: '6.5mm' }}>
                    <div className="col-12" style={{ marginBottom: '2mm' }}>
                        <h5 style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>{order.delivery_title || 'N/A'}</h5>
                    </div>
                    <div className="col-12" style={{ marginBottom: '2mm' }}>
                        <h5 style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>{packedDate}</h5>
                    </div>
                    <div className="col-12" style={{ marginBottom: '2mm' }}>
                        <h5 style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>{order.index_number}</h5>
                    </div>
                    <div className="col-12" style={{ marginBottom: '2mm' }}>
                        <h5 style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>{order.package_weight || '0'} Kg</h5>
                    </div>
                </div>

                <div className="row" style={{ marginTop: '15mm', paddingLeft: '5mm' }}>
                    <div className="col-8">
                        <div style={{ marginBottom: '1rem', marginTop: '5mm' }}>
                            <h6 className="company-title" style={{ fontSize: '18px', lineHeight: '1.2' }}>
                                බෙදාහැරීමේදී ගැටලුවක් ඇත්නම් <br />071 5 884 884 ට අමතන්න. ස්තූතියි!
                            </h6>
                        </div>
                        <div style={{ marginBottom: '1rem', marginTop: '2mm', paddingLeft: '30mm' }}>
                            <h4 className="company-title">LKR {Number(order.cod_amount || order.value || 0).toFixed(2)}</h4>
                        </div>
                    </div>
                    <div className="col-4" style={{ paddingLeft: '7mm', marginTop: '1mm' }}>
                        {order.tracking_number && (
                            <img src={qrUrl} alt="QR Code" style={{ width: '23mm', height: '23mm', backgroundColor: 'white' }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
