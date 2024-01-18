import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const page = async () => {
    const session = await getServerSession(authOptions);

    return <div>welcome to admin {session?.user.username}</div>;
};

export default page;