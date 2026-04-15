import { useMemo } from "react";
import { Button } from "flowbite-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { trackEvent } from "../analytics/ga4";

const PricingSection: React.FC = () => {
	const { t } = useTranslation();
	const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
	const apiBase =
		import.meta.env.VITE_API_BASE_URL ||
		import.meta.env.VITE_API_URL ||
		"http://localhost:8000";

	const products = useMemo(
		() =>
			[1, 2, 3].map((id) => {
				const features = t(`stripeCheckout.products.${id}.features`, { returnObjects: true }) as unknown;
				const featureList = Array.isArray(features) ? (features as string[]) : [];
				return {
					id,
					name: t(`stripeCheckout.products.${id}.name`),
					price: t(`stripeCheckout.products.${id}.price`),
					duration: t(`stripeCheckout.products.${id}.duration`),
					description: t(`stripeCheckout.products.${id}.description`),
					features: featureList,
					isDemo: id === 1,
					priceId: id === 1 ? "price_123" : id === 2 ? "price_456" : "price_789",
				};
			}),
		[t],
	);

	const handleCheckout = async (priceId: string) => {
		trackEvent("begin_checkout", { price_id: priceId });
		try {
			const stripe = await stripePromise;

			const { data: session } = await axios.post(
				`${apiBase}/api/v1/stripe/create-checkout/`,
				{ price_id: priceId },
				{ withCredentials: true },
			);

			const result = await stripe?.redirectToCheckout({
				sessionId: session.id,
			});

			if (result?.error) {
				console.error(result.error);
			}
		} catch (err) {
			console.error("Payment processing failed:", err);
		}
	};

	return (
		<section id="pricing" className="bg-white px-4 py-16 dark:bg-gray-900">
			<div className="mx-auto max-w-6xl">
				<div className="mb-12 text-center">
					<h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{t("stripeCheckout.title")}</h2>
					<p className="mt-4 text-xl text-gray-500 dark:text-gray-400">{t("stripeCheckout.subtitle")}</p>
				</div>

				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					{products.map((product) => (
						<div
							key={product.id}
							className={`rounded-lg p-6 shadow-lg ${
								product.isDemo
									? "bg-gradient-to-b from-blue-500 to-blue-600 text-white"
									: "bg-white dark:bg-gray-800"
							}`}
						>
							<div className="mb-6">
								<h3 className={`mb-2 text-2xl font-bold ${!product.isDemo && "text-gray-900 dark:text-white"}`}>{product.name}</h3>
								<div className="mb-2 flex items-baseline">
									<span className="text-4xl font-extrabold">{product.price}</span>
									<span className="ml-2 text-gray-500 dark:text-gray-400">{product.duration}</span>
								</div>
								<p className={`text-lg ${product.isDemo ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>{product.description}</p>
							</div>

							<div className={`mb-6 h-px ${product.isDemo ? "bg-blue-400" : "bg-gray-200 dark:bg-gray-700"}`} />

							<ul className="mb-8 space-y-4">
								{product.features.map((feature, index) => (
									<li key={index} className="flex items-center">
										<svg
											className={`mr-2 h-5 w-5 ${product.isDemo ? "text-blue-300" : "text-blue-600 dark:text-blue-500"}`}
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										<span className={product.isDemo ? "text-blue-50" : "text-gray-900 dark:text-white"}>{feature}</span>
									</li>
								))}
							</ul>

							<div className="text-center">
								<Button
									onClick={() => (product.isDemo ? null : void handleCheckout(product.priceId))}
									color={product.isDemo ? "light" : "blue"}
									className={`w-full ${!product.isDemo && "transform transition-transform duration-200 hover:scale-105"}`}
									disabled={product.isDemo}
								>
									{product.isDemo ? t("stripeCheckout.demoVersion") : t("stripeCheckout.buyNow")}
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default PricingSection;
