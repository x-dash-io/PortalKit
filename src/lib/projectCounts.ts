import Approval from '@/lib/models/Approval';
import File from '@/lib/models/File';
import Invoice from '@/lib/models/Invoice';
import { Types } from 'mongoose';

export interface ProjectCounts {
  approvals: Record<string, number>;
  files: Record<string, number>;
  invoices: Record<string, number>;
}

function toCountMap(rows: Array<{ _id: unknown; count: number }>) {
  return rows.reduce<Record<string, number>>((accumulator, row) => {
    const key =
      typeof row._id === 'string'
        ? row._id
        : row._id && typeof row._id === 'object' && 'toString' in row._id
          ? row._id.toString()
          : '';

    if (key) {
      accumulator[key] = row.count;
    }

    return accumulator;
  }, {});
}

export async function getProjectCounts(projectIds: string[]): Promise<ProjectCounts> {
  const objectIds = projectIds
    .filter((projectId) => Types.ObjectId.isValid(projectId))
    .map((projectId) => new Types.ObjectId(projectId));

  if (objectIds.length === 0) {
    return { approvals: {}, files: {}, invoices: {} };
  }

  const [approvalRows, fileRows, invoiceRows] = await Promise.all([
    Approval.aggregate<{ _id: unknown; count: number }>([
      { $match: { projectId: { $in: objectIds } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
    ]),
    File.aggregate<{ _id: unknown; count: number }>([
      { $match: { projectId: { $in: objectIds }, status: 'active' } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
    ]),
    Invoice.aggregate<{ _id: unknown; count: number }>([
      { $match: { projectId: { $in: objectIds } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
    ]),
  ]);

  return {
    approvals: toCountMap(approvalRows),
    files: toCountMap(fileRows),
    invoices: toCountMap(invoiceRows),
  };
}
