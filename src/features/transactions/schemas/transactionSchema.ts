import * as z from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['Expense', 'Income']),
  amount: z
    .any()
    .transform((val) => (val === '' || val === null ? NaN : Number(val)))
    .pipe(
      z.number({ invalid_type_error: 'Fill Correct Amount value' })
        .min(0.01, 'Amount is greater than 0')
    ),
  category: z.string().min(1, 'Please Fill Category'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().nullable().optional()
})

export type TransactionFormValues = z.infer<typeof transactionSchema>