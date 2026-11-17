# MOD-016 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/components/dashboard/CashflowChart.tsx

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/CashflowChart.tsx#L7) | `function ChartTip({ active, payload, label }: TipProps) {` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/CashflowChart.tsx#L23) | `export function CashflowChart({ height = 220 }: {height?: number;}) {` |
## src/components/dashboard/CustomizeDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/CustomizeDialog.tsx#L18) | `function Group({` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/CustomizeDialog.tsx#L54) | `export function CustomizeDialog({ open, onOpenChange, metrics, panels, onReorder, onToggle, onReset }: CustomizeDialogProps) {` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/CustomizeDialog.tsx#L56) | `<Dialog open={open} onOpenChange={onOpenChange}>` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/CustomizeDialog.tsx#L69) | `<Button variant="ghost" onClick={onReset}>` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/CustomizeDialog.tsx#L72) | `<Button onClick={() => onOpenChange(false)}>Done</Button>` |
## src/components/dashboard/DuesList.tsx

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/DuesList.tsx#L8) | `export function DuesList() {` |
## src/components/dashboard/MetricCard.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/MetricCard.tsx#L23) | `function config(id: DashboardWidget['id']): MetricConfig {` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/MetricCard.tsx#L85) | `export function MetricCard({ widget }: {widget: DashboardWidget;}) {` |
## src/components/dashboard/RecentSalesTable.tsx

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/RecentSalesTable.tsx#L8) | `export function RecentSalesTable() {` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/RecentSalesTable.tsx#L15) | `const update=()=>{` |
## src/components/dashboard/SalesTrendChart.tsx

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/SalesTrendChart.tsx#L7) | `function ChartTip({ active, payload, label }: TipProps) {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/SalesTrendChart.tsx#L25) | `export function SalesTrendChart({ height = 220 }: {height?: number;}) {` |
## src/components/dashboard/WidgetFrame.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/WidgetFrame.tsx#L14) | `export function WidgetFrame({ editing, label, onHide, onMove, className = '', children }: WidgetFrameProps) {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/WidgetFrame.tsx#L25) | `<button onClick={() => onMove(-1)} aria-label={ʼMove ${label} earlierʼ} className="rounded-md p-1 text-ink-500 hover:bg-ink-50 hover:text-ink">` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/WidgetFrame.tsx#L28) | `<button onClick={() => onMove(1)} aria-label={ʼMove ${label} laterʼ} className="rounded-md p-1 text-ink-500 hover:bg-ink-50 hover:text-ink">` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/WidgetFrame.tsx#L32) | `<button onClick={onHide} aria-label={ʼHide ${label}ʼ} className="rounded-md p-1 text-ink-500 hover:bg-danger-bg hover:text-danger">` |
## src/hooks/useDashboardLayout.ts

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useDashboardLayout.ts#L7) | `function load(): DashboardWidget[] {` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useDashboardLayout.ts#L11) | `const saved = JSON.parse(raw) as {id: DashboardWidgetId;visible: boolean;}[];` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useDashboardLayout.ts#L13) | `const restored = saved.` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useDashboardLayout.ts#L23) | `export function useDashboardLayout() {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useDashboardLayout.ts#L24) | `const [widgets, setWidgets] = useState<DashboardWidget[]>(load);` |
## src/pages/Dashboard.tsx

| Source line | Existing declaration / binding |
|---|---|
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L27) | `function Legend({ items }: {items: {label: string;className: string;}[];}) {` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L39) | `function PanelContent({ widget }: {widget: DashboardWidget;}) {` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L92) | `export function Dashboard() {` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L101) | `const [editing, setEditing] = useState(false);` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L102) | `const [dialogOpen, setDialogOpen] = useState(false);` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L117) | `<Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L120) | `<Button size="sm" onClick={() => setEditing(false)}>` |
| [125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L125) | `<Button variant="outline" size="sm" onClick={() => setEditing(true)}>` |
| [136](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L136) | `<button onClick={() => setDialogOpen(true)} className="font-medium underline-offset-2 hover:underline">` |
| [176](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L176) | `<Button className="mt-4" size="sm" onClick={() => setDialogOpen(true)}>Choose widgets</Button>` |
| [182](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L182) | `onOpenChange={setDialogOpen}` |
## src/pages/GlobalSearch.tsx

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/GlobalSearch.tsx#L8) | `export function GlobalSearch() {` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/GlobalSearch.tsx#L12) | `const records=globalSearchRecords(state,actorId,personal.language);` |
