export default function PageTitle({ data }) {
  return (
    <div className="wrap pgw" style={{ paddingBottom: 0 }}>
      <h1 className="pg-t" style={{ marginBottom: 0 }}>
        {data.title}
      </h1>
      {data.ghost && (
        <div className="pg-ghost" style={{ top: '9rem' }}>
          {data.ghost}
        </div>
      )}
    </div>
  );
}
