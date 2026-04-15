import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import i18n from "../i18n";
import { Navbar } from "../layout";

describe("Navbar auth navigation", () => {
	beforeEach(async () => {
		await i18n.changeLanguage("it");
		localStorage.clear();
	});

	it("shows marketing About link when not logged in", () => {
		render(
			<MemoryRouter initialEntries={["/it"]}>
				<Routes>
					<Route path="/:lang/*" element={<Navbar />} />
				</Routes>
			</MemoryRouter>,
		);
		expect(screen.getByRole("link", { name: "Chi siamo" })).toBeInTheDocument();
	});

	it("hides marketing links and shows app nav when access token is present", () => {
		localStorage.setItem("access_token", "dummy");
		render(
			<MemoryRouter initialEntries={["/it"]}>
				<Routes>
					<Route path="/:lang/*" element={<Navbar />} />
				</Routes>
			</MemoryRouter>,
		);
		expect(screen.queryByRole("link", { name: "Chi siamo" })).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Impostazioni" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Nuovo CV" })).toBeInTheDocument();
	});
});
