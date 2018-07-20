create table ice_users as
SELECT a.Id,FirstName,LastName,EmployeeNumber,Telephone phone,b.Description Department,c.Description Building,username,password,img_profile,uuid 
FROM `PersonTable` a left join DepartmentTable b on DepartmentId=b.Id
left join FacilityTable c on a.FacilityId=c.Id;