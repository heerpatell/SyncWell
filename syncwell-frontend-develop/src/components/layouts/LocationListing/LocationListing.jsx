import React from "react";
import Text from "../../components/Text";
import { AiOutlineDelete } from "react-icons/ai";

function LocationListing({ icon, loc, onDelete }) {
	const handleDelete = () => {
		onDelete(loc);
	};

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				marginTop: "0.8rem",
				cursor: "pointer",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					columnGap: "10px",
				}}
			>
				{ icon }
				<Text txt={loc} txtsize={"body2"} />
			</div>
			<AiOutlineDelete
				size={15}
				onClick={handleDelete}
				data-testid="delete-icon"
			/>
		</div>
	);
}

export default LocationListing;
