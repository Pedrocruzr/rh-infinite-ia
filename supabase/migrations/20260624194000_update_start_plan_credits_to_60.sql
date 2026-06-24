-- Update the monthly credits and description of the Complete Plan ('start') to 60
update public.plans 
   set monthly_credits = 60,
       description = '1 usuário, 60 créditos mensais, todos os agentes liberados e preço travado por 12 meses.'
 where code = 'start';
