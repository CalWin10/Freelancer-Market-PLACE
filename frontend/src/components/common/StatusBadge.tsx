type StatusBadgeProps = {
  status: string;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getColor = () => {
    switch (status) {
      case "OPEN":
        return "#28a745";

      case "DRAFT":
        return "#6c757d";

      case "ASSIGNED":
        return "#007bff";

      case "COMPLETED":
        return "#17a2b8";

      case "ARCHIVED":
        return "#dc3545";

      default:
        return "#6c757d";
    }
  };

  return (
    <span
      style={{
        backgroundColor: getColor(),
        color: "white",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "bold",
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;