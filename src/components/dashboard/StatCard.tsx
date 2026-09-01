interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <h3>{title}</h3>
      </div>

      <div className="stat-card-value">{value}</div>

      {description && <p className="stat-card-description">{description}</p>}
    </div>
  );
}

export default StatCard;
