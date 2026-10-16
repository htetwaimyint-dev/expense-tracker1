import * as z from 'zod'

export const budgetSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  limitAmount: z
    .any()
    .transform((val) => (val === '' || val === null ? NaN : Number(val)))
    .pipe(
      z.number({ invalid_type_error: 'Fill correct limit amount value' })
        .min(0.01, 'Limit amount must be greater than 0')
    ),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>