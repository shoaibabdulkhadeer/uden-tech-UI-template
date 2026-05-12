import { Typography } from 'antd';
const { Text } = Typography;
const TableHeader = ({ title }: { title: string }) => <Text style={{ fontSize: 13 }}>{title}</Text>;

export { TableHeader };
