export default function Escrow({
  approved,
  disabled,
  address,
  arbiter,
  beneficiary,
  value,
  handleApprove,
}) {
  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {value} ETH </div>
        </li>
        {approved ? (
          <div className={"complete"}> ✓ It's been approved! </div>
        ) : (
          <button
            className={"button"}
            id={address}
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              handleApprove();
            }}
          >
            Approve
          </button>
        )}
      </ul>
    </div>
  );
}
