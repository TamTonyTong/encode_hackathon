"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle";

interface DeliveryStep {
    id: string;
    titleEn: string;
    titleVi: string;
    descEn: string;
    descVi: string;
    icon: string;
    durationMs: number;
}

const DELIVERY_STEPS: DeliveryStep[] = [
    {
        id: "confirmed",
        titleEn: "Order Confirmed",
        titleVi: "Đã xác nhận đơn hàng",
        descEn: "Your order has been received and confirmed",
        descVi: "Đơn hàng của bạn đã được tiếp nhận và xác nhận",
        icon: "✅",
        durationMs: 3000,
    },
    {
        id: "preparing",
        titleEn: "Preparing Order",
        titleVi: "Đang chuẩn bị đơn hàng",
        descEn: "Our team is gathering your items",
        descVi: "Đội ngũ của chúng tôi đang thu thập các sản phẩm",
        icon: "📦",
        durationMs: 5000,
    },
    {
        id: "picked_up",
        titleEn: "Order Picked Up",
        titleVi: "Đã lấy hàng",
        descEn: "Driver has collected your order",
        descVi: "Tài xế đã lấy đơn hàng của bạn",
        icon: "🚗",
        durationMs: 4000,
    },
    {
        id: "on_the_way",
        titleEn: "On The Way",
        titleVi: "Đang giao hàng",
        descEn: "Your order is on its way to you",
        descVi: "Đơn hàng đang trên đường đến bạn",
        icon: "🛵",
        durationMs: 6000,
    },
    {
        id: "delivered",
        titleEn: "Delivered",
        titleVi: "Đã giao hàng",
        descEn: "Your order has been delivered. Enjoy!",
        descVi: "Đơn hàng đã được giao. Chúc ngon miệng!",
        icon: "🎉",
        durationMs: 0,
    },
];

function ProgressContent() {
    const { language, t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    const totalItems = searchParams.get("items") || "0";
    const totalPrice = searchParams.get("total") || "0";

    // Simulate delivery progress
    useEffect(() => {
        if (currentStep >= DELIVERY_STEPS.length - 1) return;

        const step = DELIVERY_STEPS[currentStep];
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setCurrentStep((s) => s + 1);
                    return 0;
                }
                return prev + 2;
            });
        }, step.durationMs / 50);

        return () => clearInterval(interval);
    }, [currentStep]);

    const formatCurrency = (amount: string) => {
        const num = parseFloat(amount);
        return language === "vi"
            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num)
            : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-[var(--text-primary)]">
                        {language === "vi" ? "Theo dõi đơn hàng" : "Order Tracking"}
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        {language === "vi"
                            ? `${totalItems} sản phẩm • ${formatCurrency(totalPrice)}`
                            : `${totalItems} items • ${formatCurrency(totalPrice)}`}
                    </p>
                </div>
                <LanguageToggle />
            </div>

            {/* Main Progress Card */}
            <div className="glass-panel rounded-2xl p-8 border border-[var(--border-subtle)]">
                {/* Current Status */}
                <div className="text-center mb-10">
                    <div className="text-6xl mb-4 animate-bounce">
                        {DELIVERY_STEPS[currentStep].icon}
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        {language === "vi"
                            ? DELIVERY_STEPS[currentStep].titleVi
                            : DELIVERY_STEPS[currentStep].titleEn}
                    </h2>
                    <p className="text-[var(--text-secondary)] mt-2">
                        {language === "vi"
                            ? DELIVERY_STEPS[currentStep].descVi
                            : DELIVERY_STEPS[currentStep].descEn}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-[var(--bg-surface)] rounded-full">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full transition-all duration-300"
                            style={{
                                width: `${((currentStep + progress / 100) / (DELIVERY_STEPS.length - 1)) * 100}%`,
                            }}
                        />
                    </div>

                    {/* Step Indicators */}
                    <div className="relative flex justify-between">
                        {DELIVERY_STEPS.map((step, index) => {
                            const isCompleted = index < currentStep;
                            const isCurrent = index === currentStep;
                            const isPending = index > currentStep;

                            return (
                                <div key={step.id} className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${isCompleted
                                                ? "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-black"
                                                : isCurrent
                                                    ? "bg-[var(--accent-primary)] text-black ring-4 ring-[var(--accent-primary)]/30"
                                                    : "bg-[var(--bg-surface)] text-[var(--text-muted)]"
                                            }`}
                                    >
                                        {isCompleted ? "✓" : step.icon}
                                    </div>
                                    <span
                                        className={`mt-3 text-xs font-medium text-center max-w-[80px] ${isCompleted || isCurrent
                                                ? "text-[var(--text-primary)]"
                                                : "text-[var(--text-muted)]"
                                            }`}
                                    >
                                        {language === "vi" ? step.titleVi : step.titleEn}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Estimated Time */}
                {currentStep < DELIVERY_STEPS.length - 1 && (
                    <div className="mt-10 text-center">
                        <p className="text-sm text-[var(--text-muted)]">
                            {language === "vi" ? "Thời gian dự kiến" : "Estimated time"}
                        </p>
                        <p className="text-xl font-bold text-[var(--accent-primary)]">
                            {language === "vi" ? "15-20 phút" : "15-20 minutes"}
                        </p>
                    </div>
                )}

                {/* Completed Message */}
                {currentStep >= DELIVERY_STEPS.length - 1 && (
                    <div className="mt-10 text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 rounded-full font-bold">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            {language === "vi" ? "Giao hàng thành công!" : "Delivery complete!"}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
                <button
                    onClick={() => router.push("/dashboard/grocery")}
                    className="px-6 py-3 glass-panel rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium hover:border-[var(--border-hover)] transition-colors"
                >
                    {language === "vi" ? "← Quay lại mua sắm" : "← Back to Shopping"}
                </button>
                {currentStep >= DELIVERY_STEPS.length - 1 && (
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="px-6 py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-black rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                        {language === "vi" ? "Về trang chủ" : "Go to Dashboard"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function ProgressPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-[var(--text-muted)]">Loading...</div>}>
            <ProgressContent />
        </Suspense>
    );
}
