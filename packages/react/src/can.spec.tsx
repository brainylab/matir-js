import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./matirContext", () => ({
  useAbility: vi.fn(),
}));

import { Can } from "./can";
import { useAbility } from "./matirContext";

const mockAbility = { can: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAbility).mockReturnValue(mockAbility as any);
});

describe("Can", () => {
  describe("modo normal", () => {
    it("should render children when allowed", () => {
      mockAbility.can.mockReturnValue(true);

      render(
        <Can subject="order" actions="read">
          <span>allowed</span>
        </Can>,
      );

      expect(screen.getByText("allowed")).toBeInTheDocument();
    });

    it("should not render children when not allowed", () => {
      mockAbility.can.mockReturnValue(false);

      render(
        <Can subject="order" actions="read">
          <span>allowed</span>
        </Can>,
      );

      expect(screen.queryByText("allowed")).not.toBeInTheDocument();
    });

    it("should render fallback when not allowed", () => {
      mockAbility.can.mockReturnValue(false);

      render(
        <Can subject="order" actions="read" fallback={<span>fallback</span>}>
          <span>allowed</span>
        </Can>,
      );

      expect(screen.queryByText("allowed")).not.toBeInTheDocument();
      expect(screen.getByText("fallback")).toBeInTheDocument();
    });

    it("should render null when not allowed and no fallback", () => {
      mockAbility.can.mockReturnValue(false);

      const { container } = render(
        <Can subject="order" actions="read">
          <span>allowed</span>
        </Can>,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("passThrough", () => {
    it("should call children as render prop with allowed=true", () => {
      mockAbility.can.mockReturnValue(true);

      render(
        <Can subject="order" passThrough>
          {(allowed) => <span>{allowed ? "yes" : "no"}</span>}
        </Can>,
      );

      expect(screen.getByText("yes")).toBeInTheDocument();
    });

    it("should call children as render prop with allowed=false", () => {
      mockAbility.can.mockReturnValue(false);

      render(
        <Can subject="order" passThrough>
          {(allowed) => <span>{allowed ? "yes" : "no"}</span>}
        </Can>,
      );

      expect(screen.getByText("no")).toBeInTheDocument();
    });
  });

  describe("ability.can args", () => {
    it("should call ability.can with subject and actions", () => {
      mockAbility.can.mockReturnValue(true);

      render(
        <Can subject="order" actions="read">
          <span />
        </Can>,
      );

      expect(mockAbility.can).toHaveBeenCalledWith(
        "order",
        "read",
        undefined,
        undefined,
      );
    });

    it("should call ability.can with condition and context", () => {
      mockAbility.can.mockReturnValue(true);

      render(
        <Can
          subject="order"
          actions="read"
          condition={{ status: "draft" }}
          context={{ userId: 1 }}
        >
          <span />
        </Can>,
      );

      expect(mockAbility.can).toHaveBeenCalledWith(
        "order",
        "read",
        { status: "draft" },
        { userId: 1 },
      );
    });
  });
});
